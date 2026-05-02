import { Alert, Button, Card, CardContent, Divider, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { requestsApi } from '@/api/requests';
import type { RequestCommentDto, RequestDetailsDto, RequestDocumentDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime } from '@/lib/format';
import { useAuth } from '@/lib/useAuth';
import styles from '@/styles/page.module.css';

export function RequestDetailsPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetailsDto | null>(null);
  const [documents, setDocuments] = useState<RequestDocumentDto[]>([]);
  const [comments, setComments] = useState<RequestCommentDto[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadMessageSeverity, setUploadMessageSeverity] = useState<AlertColor>('success');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    let active = true;

    void Promise.all([
      requestsApi.details(Number(requestId)),
      requestsApi.documents(Number(requestId)),
      requestsApi.comments(Number(requestId)),
    ])
      .then(([requestDetails, requestDocuments, requestComments]) => {
        if (!active) {
          return;
        }

        setRequest(requestDetails);
        setDocuments(requestDocuments);
        setComments(requestComments);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load request details.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  const handleUpload = async () => {
    if (!requestId || selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    try {
      const uploaded = await requestsApi.uploadDocuments(Number(requestId), selectedFiles);
      setDocuments(uploaded);
      setSelectedFiles([]);
      setUploadMessageSeverity('success');
      setUploadMessage('Documents uploaded successfully.');
    } catch (err: unknown) {
      setUploadMessageSeverity('error');
      setUploadMessage(err instanceof Error ? err.message : 'Could not upload documents.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      {request ? (
        <>
          <PageHeader
            title={request.serviceTitle}
            description={request.description}
            actions={<StatusBadge status={request.status} />}
          />

          <div className={styles.twoColumn}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Application Summary</Typography>
                  <Divider className={styles.dividerY} />
                  <Stack spacing={1.2}>
                    <Typography>
                      <strong>Title:</strong> {request.title}
                    </Typography>
                    <Typography>
                      <strong>Submitted:</strong> {formatDateTime(request.createdAt)}
                    </Typography>
                    <Typography>
                      <strong>Last updated:</strong> {formatDateTime(request.updatedAt)}
                    </Typography>
                    <Typography>
                      <strong>Applicant:</strong> {user?.fullName ?? request.applicantEmail}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={styles.inlineForm}>
                  <Typography variant="h4">Upload Additional Documents</Typography>
                  <TextField
                    type="file"
                    inputProps={{ multiple: true }}
                    onChange={(event) =>
                      setSelectedFiles(Array.from((event.target as HTMLInputElement).files ?? []))
                    }
                    helperText="You can upload multiple files at once."
                  />
                  {uploadMessage ? <Alert severity={uploadMessageSeverity}>{uploadMessage}</Alert> : null}
                  <Button variant="contained" onClick={() => void handleUpload()} disabled={isUploading || selectedFiles.length === 0}>
                    {isUploading ? 'Uploading...' : 'Upload Documents'}
                  </Button>
                </CardContent>
              </Card>
            </Stack>

            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Documents</Typography>
                  {documents.length ? (
                    <List>
                      {documents.map((document) => (
                        <ListItem key={document.id} disablePadding className={styles.listItemSpacious}>
                          <ListItemText
                            primary={document.originalFileName}
                            secondary={`${document.fileType} - uploaded ${formatDateTime(document.uploadedAt)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" className={styles.mutedTop}>
                      No documents uploaded yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h4">Officer Notes</Typography>
                  {comments.length ? (
                    <List>
                      {comments.map((comment) => (
                        <ListItem key={comment.id} disablePadding className={styles.listItemSpacious}>
                          <ListItemText primary={comment.comment} secondary={`${comment.authorRole} - ${formatDateTime(comment.createdAt)}`} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary" className={styles.mutedTop}>
                      No officer comments yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </div>
        </>
      ) : null}

      {loading ? <Typography color="text.secondary">Loading request details...</Typography> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
    </div>
  );
}
