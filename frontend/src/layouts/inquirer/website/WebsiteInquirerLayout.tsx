import BaseAppLayout from '../../BaseAppLayout';
import WebsiteInquirerSidebar from './WebsiteInquirerSidebar';

export default function WebsiteInquirerLayout() {
  return (
    <BaseAppLayout
      title="Website Inquirer"
      sidebar={<WebsiteInquirerSidebar />}
    />
  );
}
