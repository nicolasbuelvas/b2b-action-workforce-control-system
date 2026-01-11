import BaseAppLayout from '../../BaseAppLayout';
import LinkedinInquirerSidebar from './LinkedinInquirerSidebar';

export default function LinkedinInquirerLayout() {
  return (
    <BaseAppLayout
      title="LinkedIn Inquirer"
      sidebar={<LinkedinInquirerSidebar />}
    />
  );
}