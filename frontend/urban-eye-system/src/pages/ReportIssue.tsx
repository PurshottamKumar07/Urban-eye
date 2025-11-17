import ReportIssueForm from '@/components/issues/ReportIssueForm';

const ReportIssue = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Report a Civic Issue</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help improve your community by reporting civic issues. Your reports help local authorities 
          identify and address problems more efficiently.
        </p>
      </div>

      <ReportIssueForm />
    </div>
  );
};

export default ReportIssue;