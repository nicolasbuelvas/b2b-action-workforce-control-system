import BaseAppLayout from '../BaseAppLayout';
import SubAdminSidebar from './SubAdminSidebar';

export default function SubAdminLayout() {
  return (
    <BaseAppLayout
      title="Sub Admin Panel"
      sidebar={<SubAdminSidebar />}
    />
  );
}