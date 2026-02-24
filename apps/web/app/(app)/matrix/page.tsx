'use client';

import { MatrixGrid } from '@/components/MatrixGrid';

export default function MatrixPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Eisenhower Matrix</h1>
      <MatrixGrid />
    </div>
  );
}
