// StatusBadge — renders the appropriate badge for application status
const StatusBadge = ({ status }) => {
  const styles = {
    applied: 'badge-applied',
    shortlisted: 'badge-shortlisted',
    selected: 'badge-selected',
    rejected: 'badge-rejected',
  };

  return (
    <span className={styles[status] || 'badge-applied'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
