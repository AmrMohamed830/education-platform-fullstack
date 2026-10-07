import { cn } from '@/utils/cn';

export default function Container({ children, className = '', ...props }) {
  return (
    <div className={cn('container', className)} {...props}>
      {children}
    </div>
  );
}
