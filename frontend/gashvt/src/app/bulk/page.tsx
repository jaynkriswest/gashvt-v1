'use client'
import BulkProcessingView from '@/components/BulkProcessingView';

// Ensure the function name is capitalized and has the 'export default' prefix
export default function BulkPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      <BulkProcessingView />
    </div>
  );
}