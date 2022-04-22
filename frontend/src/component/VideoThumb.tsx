import React from 'react';
import { Image } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { fallbackImageUrl } from '../pages/project/constant';
import VideoModal from './VideoModal';
import { ImagePreviewType } from 'rc-image';

interface IVideoThumbProps {
  thumbUrl: string;
  videoUrl: string;
  videoModalVisible: boolean;
  setVideoModalVisible: (flag: boolean) => void;
}

export default function VideoThumb(props: IVideoThumbProps) {
  const { thumbUrl, videoUrl, videoModalVisible, setVideoModalVisible } = props;

  const customVideoPreview: ImagePreviewType = {
    visible: false,
    onVisibleChange: (visible: boolean) => setVideoModalVisible(visible),
    mask: (
      <>
        <PlayCircleOutlined style={{ marginRight: 4 }} />
        播放视频
      </>
    )
  };

  return (
    <>
      <Image src={thumbUrl} fallback={fallbackImageUrl} placeholder={true} preview={customVideoPreview}></Image>
      <VideoModal visible={videoModalVisible} onClose={() => setVideoModalVisible(false)} videoSrc={videoUrl} coverSrc={thumbUrl}></VideoModal>
    </>
  );
}
