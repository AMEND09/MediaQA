import React from 'react';
import { Box, Chip, Stack, Avatar } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function MessageAttachments({ files }) {
  if (!files || files.length === 0) return null;
  
  // Only show up to 3 files with a +X more chip if there are more
  const displayFiles = files.slice(0, 3);
  const remainingCount = files.length - 3;
  
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon fontSize="small" />;
    if (file.type.startsWith('video/')) return <VideoFileIcon fontSize="small" />;
    if (file.type.startsWith('audio/')) return <AudioFileIcon fontSize="small" />;
    if (file.type === 'application/pdf') return <PictureAsPdfIcon fontSize="small" />;
    return <InsertDriveFileIcon fontSize="small" />;
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {displayFiles.map((file, index) => (
          <Chip
            key={index}
            avatar={<Avatar>{getFileIcon(file)}</Avatar>}
            label={file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name}
            size="small"
            variant="outlined"
          />
        ))}
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
    </Box>
  );
}

export default MessageAttachments;
