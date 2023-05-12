import { FC, PropsWithChildren } from 'react';
import cx from '../../../utils/cx';

const ToolbarWrapper: FC<PropsWithChildren> = ({ children }) => (
  <div className={cx(
    'flex items-center',
    'bg-white',
    'border border-gray-200',
    'rounded-lg',
    'p-1 gap-1',
    'drop-shadow-md',
  )}>
    {children}
  </div>
);

export default ToolbarWrapper;
