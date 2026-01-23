import BaseAppLayout from '../../BaseAppLayout';
import LinkedinAuditorSidebar from './LinkedinAuditorSidebar';

export default function LinkedinAuditorLayout() {
  return (
    <BaseAppLayout
      title="LinkedIn Auditor"
      sidebar={<LinkedinAuditorSidebar />}
    />
  );
}
