import React, { useEffect, useState } from 'react';
import { Drawer, Divider, message, Empty, Descriptions, Card, Col, Row, Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

// import { fetchProject } from '../../utils/api/api';
import { defaultProject } from './constant';
import VideoModal from '../../component/VideoModal';
import { asyncResult, fetchProject } from '../../utils/api/api';
import ProjectStatusTag from '../../component/ProjectStatusTag';
import VideoThumb from '../../component/VideoThumb';
import ProjectHeatmap from './ProjectHeatmap';

interface IProjectDetailProps {
  onClose: () => void;
  visible: boolean;
  pid: number;
}

export default function ProjectDetail(props: IProjectDetailProps) {
  const { onClose, visible, pid } = props;
  const [showProject, setShowProject] = useState<Entity.Project>(defaultProject);
  const [rawVideoModalVisible, setRawVideoModalVisible] = useState<boolean>(false);
  const [resultVideoModalVisible, setResultVideoModalVisible] = useState<boolean>(false);
  useEffect(() => {
    if (pid > 0) {
      try {
        fetchProject({ pid: pid })
          .then(msg => {
            if (msg.status) {
              setShowProject(msg.data);
            }
          })
          .catch(err => {
            message.error(`获取pid为 ${pid} 的项目信息失败`);
            console.log(`Get project info with pid ${pid} error`, err);
          });
      } catch (error) {
        message.error(`获取pid为 ${pid} 的项目信息失败`);
      }
    }
  }, [pid]);

  return (
    <Drawer width={700} placement="right" title="检测项目详情" onClose={onClose} visible={visible}>
      {pid === 0 ? (
        <Empty />
      ) : (
        <>
          <Row>
            <Col span={24}>
              <Card title={'基本信息'}>
                <Descriptions column={2} size="default">
                  <Descriptions.Item label="项目名称" span={1}>
                    {showProject.projectName}
                  </Descriptions.Item>
                  <Descriptions.Item label="所属用户" span={1}>
                    {`<uid:${showProject.uid}>${showProject.projectUserName}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="项目状态" span={1}>
                    <ProjectStatusTag projectStatus={showProject.projectStatus} />
                  </Descriptions.Item>
                  <Descriptions.Item label="原检测视频" span={1}>
                    <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => setRawVideoModalVisible(true)}>
                      播放视频
                    </Button>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Divider />
            <Col span={24}>
              <Card
                title={'展示检测过程'}
                extra={<ProjectHeatmap projectResultPointList={showProject.projectResultPointList} projectThumbUrl={showProject.projectThumbUrl} />}
              >
                {showProject.projectResultVideoUrl && showProject.projectHeatmapUrl ? (
                  <VideoThumb
                    thumbUrl={showProject.projectHeatmapUrl}
                    videoUrl={showProject.projectResultVideoUrl}
                    videoModalVisible={resultVideoModalVisible}
                    setVideoModalVisible={setResultVideoModalVisible}
                  ></VideoThumb>
                ) : (
                  <Empty />
                )}
              </Card>
            </Col>
            <Divider />
          </Row>
          {showProject.projectRawVideoUrl && showProject.projectThumbUrl ? (
            <VideoModal
              visible={rawVideoModalVisible}
              onClose={() => setRawVideoModalVisible(false)}
              videoSrc={showProject.projectRawVideoUrl}
              coverSrc={showProject.projectThumbUrl}
            />
          ) : (
            <Empty />
          )}
          <Col span={24}>
            <Card title={'基本信息'}>
              <Descriptions column={2} size="default">
                <Descriptions.Item label="原检测视频" span={1}>
                  <Button
                    disabled={showProject?.taskId ? false : true}
                    type="primary"
                    size="small"
                    onClick={async () => {
                      if (showProject.taskId) {
                        const { data: taskAsyncResult } = await asyncResult({ taskId: showProject.taskId });
                        if (taskAsyncResult.status === 200) {
                          console.log(taskAsyncResult.data);
                        } else {
                          console.error('Get AsyncResult error', taskAsyncResult.message);
                          message.error('获取项目运行情况失败，请查看console');
                        }
                      } else {
                        message.error('项目尚未启动，无法获取运行情况');
                      }
                    }}
                  >
                    获取运行情况
                  </Button>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Divider />
        </>
      )}
    </Drawer>
  );
}
