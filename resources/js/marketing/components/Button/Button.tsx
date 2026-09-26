import type {AnchorHTMLAttributes, ButtonHTMLAttributes} from 'react';
import {cx} from '../../../shared/lib/cx';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg'; // ~36 / 44 / 52 px

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function buttonClassName({variant = 'primary', size = 'md', fullWidth = false}: StyleProps, className?: string): string {
  return cx('mk-button', `mk-button--${variant}`, `mk-button--${size}`, fullWidth && 'mk-button--full', className);
}

/** Action control: always a native <button>. Defaults to type="button" so it never submits a form by accident. */
export function Button({variant, size, fullWidth, className, type = 'button', ...rest}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonClassName({variant, size, fullWidth}, className)} {...rest}/>;
}

/** Navigation styled as a button: stays a native <a href>. */
export function ButtonLink({variant, size, fullWidth, className, ...rest}: StyleProps & AnchorHTMLAttributes<HTMLAnchorElement> & {href: string}) {
  return <a className={buttonClassName({variant, size, fullWidth}, className)} {...rest}/>;
}
