import BaseAppLayout from '../../BaseAppLayout';
import WebsiteResearchAuditorSidebar from './WebsiteResearchAuditorSidebar';

export default function WebsiteResearchAuditorLayout() {
  return (
    <BaseAppLayout
      title="Website Research Auditor"
      sidebar={<WebsiteResearchAuditorSidebar />}
    />
  );
}
