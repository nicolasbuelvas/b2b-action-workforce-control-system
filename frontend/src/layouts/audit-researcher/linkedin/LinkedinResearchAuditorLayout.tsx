import BaseAppLayout from '../../BaseAppLayout';
import LinkedinResearchAuditorSidebar from './LinkedinResearchAuditorSidebar';

export default function LinkedinResearchAuditorLayout() {
  return (
    <BaseAppLayout
      title="LinkedIn Research Auditor"
      sidebar={<LinkedinResearchAuditorSidebar />}
    />
  );
}
