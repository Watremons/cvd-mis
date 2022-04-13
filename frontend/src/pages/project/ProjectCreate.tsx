import React, { useState } from 'react';
import ProForm, { ProFormText, ProFormTextArea, ProFormUploadDragger } from '@ant-design/pro-form';
import { Card, Col, message, Row } from 'antd';
import { createProject } from '../../utils/api/api';
import { UploadFile } from 'antd/es/upload/interface';

export default function ProjectCreate() {
  const [loading, setLoading] = useState<boolean>(false);
  // const [uploadFile, setUploadFile] = useState<RcFile | null>(null);

  // const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   event.preventDefault();
  //   const files = event.target.files ?? [];
  //   console.log(files);
  // };

  return (
    <Row>
      <Col>
        <Card title="新建检测项目">
          <ProForm<{
            projectName: string;
            videoFileList: UploadFile[];
            description?: string;
          }>
            encType="multipart/form-data"
            onFinish={async values => {
              console.log('form values', values);
              try {
                const videoFile = values.videoFileList.shift();
                const videoFileName = videoFile?.name;
                if (!videoFileName) {
                  message.error('未上传文件！');
                  return false;
                }
                console.log('videoFile', videoFile);
                const createProjectRes = await createProject({
                  projectName: values.projectName,
                  description: values.description,
                  videoFileName: videoFileName,
                  videoFile: videoFile?.originFileObj
                });
                if (createProjectRes.data.status === 200) {
                  message.success('新建检测项目成功！');
                  return true;
                } else {
                  throw Error(`Create Project Error:${createProjectRes}`);
                }
              } catch (error) {
                message.error('新建检测项目失败，详情请查看console');
                console.error(error);
              }
              return false;
            }}
            autoFocusFirstInput
          >
            <ProForm.Group>
              <ProFormText
                disabled={loading}
                width="md"
                name="projectName"
                label="检测项目名称"
                tooltip="1-20个字符"
                placeholder="请输入检测项目名"
                fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
                rules={[
                  { required: true, message: '未输入检测项目名' },
                  { type: 'string', min: 1, max: 20, pattern: /(^[^\?!`$\s].+$)/, message: '检测项目名为1-20字符，不可包含特殊字符?!`$' }
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormUploadDragger
                width="md"
                disabled={loading}
                label="上传检测项目原始视频"
                name="videoFileList"
                max={1}
                accept="video/*"
                description="每个检测项目仅包含一个原始视频文件"
                fieldProps={{
                  maxCount: 1,
                  beforeUpload: () => false
                }}
                rules={[{ required: true, message: '需要上传一个待检测视频文件' }]}
              />
            </ProForm.Group>
            {/* <input type="file" onChange={handleUpload}></input> */}
            <ProForm.Group>
              <ProFormTextArea
                disabled={loading}
                width="xl"
                name="description"
                label="备注"
                tooltip="0-50个字符"
                placeholder="请输入备注"
                fieldProps={{ showCount: true, maxLength: 50, allowClear: true }}
              />
            </ProForm.Group>
          </ProForm>
        </Card>
      </Col>
    </Row>
  );
}
