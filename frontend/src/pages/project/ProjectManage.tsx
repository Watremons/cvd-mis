import React, { useEffect, useState } from 'react';
import { Image, Card, Col, Divider, Input, message, Popconfirm, Row, Skeleton, Space, TablePaginationConfig, Pagination, Spin, Empty } from 'antd';
import Highlighter from 'react-highlight-words';
import { DeleteOutlined, EllipsisOutlined, EyeOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';

import { deleteProject, fetchProjects, fetchUsersBasic, runDetect } from '../../utils/api/api';
import { defaultPagination, fallbackImageUrl, projectStatusEnum } from './constant';
import { joinFilterValue } from '../../utils/utils';
import ProjectStatusTag from '../../component/ProjectStatusTag';
import ProjectDetail from './ProjectDetail';
import ProjectSelect from './ProjectSelect';

export default function ProjectManage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [startLoading, setStartLoading] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(false);

  const [projectList, setProjectList] = useState<Entity.Project[]>([]);
  const [userList, setUserList] = useState<Entity.User[]>([]);
  const [nowPagnination, setNowPagnination] = useState<TablePaginationConfig>({
    ...defaultPagination
  });
  const [selectedProjectStatusList, setSelectedProjectStatusList] = useState<number[]>([]);
  const [selectedProjectUidList, setSelectedProjectUidList] = useState<number[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [chosenPid, setChosenPid] = useState<number>(0);

  useEffect(() => {
    handleListChange(
      {
        current: nowPagnination.current,
        pageSize: nowPagnination.pageSize
      },
      {
        projectStatus: selectedProjectStatusList,
        uid: selectedProjectUidList
      },
      searchText
    );
    setUserLoading(true);
    fetchUsersBasic()
      .then(({ data: newUserList }) => {
        console.log('fetchUsers result', newUserList);
        setUserList(newUserList.data);
        setUserLoading(false);
      })
      .catch(err => {
        setUserLoading(false);
        console.error('error:', err);
        message.error(`发生错误, 请查看console!`);
      });
  }, [searchText, nowPagnination.current, nowPagnination.pageSize, selectedProjectStatusList]);

  const handleListChange = (pagination: TablePaginationConfig, filters: { projectStatus: number[]; uid: number[] }, searcher: string) => {
    setLoading(true);
    // console.log('filters', filters);
    fetchProjects({
      current: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 24,
      projectStatus: joinFilterValue(filters['projectStatus']),
      uid: joinFilterValue(filters['uid']),
      search: searcher
    })
      .then(({ data: newProjectList }) => {
        console.log('fetchProjects result', newProjectList);
        setProjectList(newProjectList.data);
        setNowPagnination({
          ...defaultPagination,
          total: newProjectList.total
        });
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error('error:', err);
        message.error(`发生错误, 请查看console!`);
      });
  };

  const refreshTable = () => setNowPagnination(pagination => ({ ...pagination }));

  const generateProjectCard = () =>
    projectList.map((project: Entity.Project) => (
      <Col xs={24} sm={12} md={8} lg={6} xl={6} xxl={4} key={project.pid}>
        <Card
          title={
            <>
              {searchText ? (
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={[searchText]}
                  autoEscape
                  textToHighlight={project.projectName ? project.projectName.toString() : ''}
                />
              ) : (
                project.projectName
              )}
              <div style={{ float: 'right' }}>
                <ProjectStatusTag projectStatus={project.projectStatus} />
              </div>
            </>
          }
          actions={[
            <EllipsisOutlined
              key="ellipsis"
              onClick={() => {
                setChosenPid(project.pid);
                setDetailVisible(true);
              }}
            />,
            project.projectStatus === 0 ? (
              <Popconfirm
                key="start"
                placement="top"
                title={`确定要启动该检测项目吗`}
                disabled={startLoading}
                onConfirm={async () => {
                  setStartLoading(true);
                  try {
                    const runDetectRes = await runDetect({ pid: project.pid });
                    console.log(runDetectRes);
                    if (runDetectRes.data.status === 200) {
                      message.success(`运行检测项目 ${project.projectName} 成功！`);
                    } else {
                      throw Error(runDetectRes.data.message);
                    }
                  } catch (error) {
                    message.error(`运行检测项目 ${project.projectName} 失败, 请检查console`);
                    console.error(error);
                  }
                  refreshTable();
                  setStartLoading(false);
                }}
                okText="是"
                cancelText="否"
              >
                <PlayCircleOutlined disabled={startLoading} />
              </Popconfirm>
            ) : (
              <StopOutlined key="stop" />
            ),
            <Popconfirm
              key="delete"
              placement="top"
              title={`确定要删除该检测项目吗`}
              disabled={deleteLoading}
              onConfirm={async () => {
                setDeleteLoading(true);
                try {
                  const projectDeleteRes = await deleteProject({ pid: project.pid });
                  console.log('projectDeleteRes', projectDeleteRes);
                  if (projectDeleteRes.status === 204) {
                    message.success(`删除检测项目 ${project.projectName} 成功！`);
                  }
                } catch (error) {
                  message.error(`删除检测项目 ${project.projectName} 失败, 请检查console`);
                  console.error(error);
                }
                refreshTable();
                setDeleteLoading(false);
              }}
              okText="是"
              cancelText="否"
            >
              <DeleteOutlined disabled={deleteLoading} />
            </Popconfirm>
          ]}
        >
          <Skeleton loading={loading} active>
            <Image
              src={project.projectThumbUrl}
              fallback={fallbackImageUrl}
              placeholder={true}
              preview={{
                mask: (
                  <>
                    <EyeOutlined style={{ marginRight: 4 }} />
                    预览
                  </>
                )
              }}
            ></Image>
          </Skeleton>
        </Card>
      </Col>
    ));

  return (
    <Row>
      <Col span={24}>
        <Spin spinning={loading}>
          <Card>
            <Space direction="horizontal" align="center" size="middle" split>
              <Input.Search
                enterButton
                maxLength={20}
                placeholder="按项目名搜索"
                allowClear
                loading={loading}
                onSearch={(value: string) => setSearchText(value)}
              />
              <ProjectSelect
                maxTagCount={3}
                placeholder="筛选计划状态"
                selectedOptionList={selectedProjectStatusList}
                setSelectedOptionList={setSelectedProjectStatusList}
                options={projectStatusEnum.map((projectStatus: Constant.OptionElement) => ({
                  value: projectStatus.value,
                  label: <ProjectStatusTag projectStatus={projectStatus.value} />
                }))}
              />
              <ProjectSelect
                loading={userLoading}
                maxTagCount={3}
                placeholder="筛选用户"
                selectedOptionList={selectedProjectUidList}
                setSelectedOptionList={setSelectedProjectUidList}
                style={{ width: 200 }}
                options={userList.map((user: Entity.User) => ({
                  value: user.uid,
                  label: `<uid:${user.uid}>${user.userName}`
                }))}
              />
            </Space>
            <Divider />
            {projectList.length > 0 ? (
              <>
                <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>{generateProjectCard()}</Row>
                <Divider />
                <Pagination
                  {...nowPagnination}
                  style={{ float: 'right' }}
                  onChange={(page: number, pageSize: number) =>
                    setNowPagnination(pagnination => ({ current: page, pageSize: pageSize, ...pagnination }))
                  }
                />
              </>
            ) : (
              <Empty />
            )}
          </Card>
        </Spin>
        <ProjectDetail onClose={() => setDetailVisible(false)} visible={detailVisible} pid={chosenPid ?? 0} />
      </Col>
    </Row>
  );
}
