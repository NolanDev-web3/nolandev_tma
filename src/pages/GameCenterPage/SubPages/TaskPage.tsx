import { Gift } from 'lucide-react';
import { EmptyState, PageHeading } from '@/components/Design/Primitives';
import ProfileHeader from '../Components/ProfileHeader';
export function GameCenter_TaskPage() {
  return <div id="GameCenter_TaskPage" className="nd-page"><ProfileHeader /><PageHeading eyebrow="Tasks" title="Small steps. More possibilities." description="Your next community challenge starts here." /><EmptyState icon={<Gift size={26} />} title="New tasks are on the way" description="Check back for opportunities to take part in the Nolan community." /></div>;
}
