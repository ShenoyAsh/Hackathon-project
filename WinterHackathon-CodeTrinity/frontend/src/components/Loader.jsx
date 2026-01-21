import { Leaf } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen animate-fade-in">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin shadow-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="w-10 h-10 text-green-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
