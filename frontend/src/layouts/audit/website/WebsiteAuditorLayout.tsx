import BaseAppLayout from '../../BaseAppLayout';
import WebsiteAuditorSidebar from './WebsiteAuditorSidebar';

export default function WebsiteAuditorLayout() {
  return (
    <BaseAppLayout
      title="Website Auditor"
      sidebar={<WebsiteAuditorSidebar />}
    />
  );
}
