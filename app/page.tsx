import { PageHeader } from "@/components/page-header";
export default async function Dashboard() {

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your healthcare staffing pipeline"
      />
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        </div>
      </div>
    </>
  );
}
