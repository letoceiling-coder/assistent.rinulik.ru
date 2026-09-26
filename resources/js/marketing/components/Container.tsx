import type {ReactNode} from 'react';
import {cx} from '../../shared/lib/cx';

type ContainerElement = 'div' | 'header' | 'footer' | 'nav';

/** Centers content at max 1360px with responsive gutters (tokens: --container-max, --gutter). */
export function Container({as: Element = 'div', className, children}: {
  as?: ContainerElement;
  className?: string;
  children: ReactNode;
}) {
  return <Element className={cx('mk-container', className)}>{children}</Element>;
}
