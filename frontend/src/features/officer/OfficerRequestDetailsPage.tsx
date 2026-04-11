import { Alert, Button, Card, CardContent, Divider, List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import type { CommentType, OfficerRequestDetailsDto, RequestStatus } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime } from '@/lib/format';
import styles from '@/styles/page.module.css';

export function OfficerRequestDetailsPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState<OfficerRequestDetailsDto | null>(null);
  const [status, setStatus] = useState<RequestStatus>('SUBMITTED');
  const [comment, setComment] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('COMMENT');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<AlertColor>('success');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) {
      return;
    }

    let active = true;

    void officerApi
      .details(Number(requestId))
      .then((details) => {
        if (!active) {
          return;
        }

        setRequest(details);
        setStatus(details.status);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load request details.');
      });

    return () => {
      active = false;
    };
  }, [requestId]);

  const handleStatusUpdate = async () => {
    if (!requestId) {
      return;
    }

    try {
      const updated = await officerApi.updateStatus(Number(requestId), { status });
      setRequest(updated);
      setMessageSeverity('success');
      setMessage('Request status updated.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not update status.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!requestId || !comment.trim()) {
      return;
    }

    try {
      const created = await officerApi.addComment(Number(requestId), { comment: comment.trim(), type: commentType });
      setRequest((current) => (current ? { ...current, comments: [...current.comments, created] } : current));
      setComment('');
      setCommentType('COMMENT');
      setMessageSeverity('success');
      setMessage('Comment added.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not add comment.');
    }
  };

  return (
    <div className={styles.page}>
      {request ? (
        <>
          <PageHeader eyebrow="Officer" title={request.serviceTitle} description={request.description} actions={<StatusBadge status={request.status} />} />

          {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}

          <div className={styles.twoColumn}>
            <Stack spacing={2}>
              <Card>
                <CardContent className={styles.inlineForm}>
                  <Typography variant="h4">Review Summary</Typography>
                  <Typography>
                    <strong>Applicant:</strong> {request.applicantEmail}
                  </Typography>
                  <Typography>
                    <strong>Title:</strong> {request.title}
                  </Typography>
                  <Typography>
                    <strong>Created:</strong> {formatDateTime(request.createdAt)}
                  </Typography>
                  <Typography>
                    <strong>Updated:</strong> {formatDateTime(request.updatedAt)}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={styles.inlineForm}>
                  <Typography variant="h4">Update Status</Typography>
                  <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
                    <MenuItem value="SUBMITTED">Submitted</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="ADDITIONAL_DOCUMENTS_REQUIRED">Additional Documents Required</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </TextField>
                  <Button variant="contained" onClick={() => void handleStatusUpdate()}>
                    Save Status
                  </Button>
                </CardContent>
              </Card>
            </Stack>

            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Uploaded Documents</Typography>
                  <List>
                    {request.documents.map((document) => (
                      <ListItem key={document.id} disablePadding className={styles.listItemSpacious}>
                        <ListItemText primary={document.originalFileName} secondary={`${document.fileType} - ${formatDateTime(document.uploadedAt)}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={styles.inlineForm}>
                  <Typography variant="h4">Officer Comments</Typography>
                  <List>
                    {request.comments.map((item) => (
                      <ListItem key={item.id} disablePadding className={styles.listItemCompact}>
                        <ListItemText primary={item.comment} secondary={`${item.authorRole} - ${formatDateTime(item.createdAt)}`} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider />
                  <TextField select label="Comment Type" value={commentType} onChange={(event) => setCommentType(event.target.value as CommentType)}>
                    <MenuItem value="COMMENT">General Comment</MenuItem>
                    <MenuItem value="ADDITIONAL_DOCUMENT_REQUEST">Request More Documents</MenuItem>
                  </TextField>
                  <TextField label="Add comment" multiline minRows={4} value={comment} onChange={(event) => setComment(event.target.value)} />
                  <Button variant="contained" onClick={() => void handleCommentSubmit()}>
                    Add Comment
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </div>
        </>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {!request && !error ? <Typography color="text.secondary">Loading request details...</Typography> : null}
    </div>
  );
}
