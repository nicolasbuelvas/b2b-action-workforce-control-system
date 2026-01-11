import BaseAppLayout from '../../BaseAppLayout';
import LinkedinResearcherSidebar from './LinkedinResearcherSidebar';

export default function LinkedinResearcherLayout() {
  return (
    <BaseAppLayout
      title="LinkedIn Researcher"
      sidebar={<LinkedinResearcherSidebar />}
    />
  );
}
