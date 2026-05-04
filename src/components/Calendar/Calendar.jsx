import { Calendar as CalIcon } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';

export default function Calendar() {
  return (
    <div>
      <PageHeader title="Calendar" subtitle="Your month at a glance." />
      <Empty
        icon={CalIcon}
        title="Calendar coming next phase"
        message="Swipeable months, week view, recurring bill markers, and a jump-to-today button."
      />
    </div>
  );
}
