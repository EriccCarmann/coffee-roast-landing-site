import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import './Button.css';

// Replaces Tilda's `t-btnflex`. Works as <button> (default) or as a link: <Button as="a" href="#order">.
// The props type says: our own props + everything a <button> accepts + everything an <a> accepts.
type ButtonProps = {
  as?: 'button' | 'a';
  variant?: 'primary' | 'ghost' | 'outline' | 'light';
  size?: 'md' | 'sm';
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'>; // a link's `type` clashes with a button's

export default function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const Tag: ElementType = as;
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');
  const extra = as === 'button' && !rest.type ? { type: 'button' as const } : {};
  return (
    <Tag className={classes} {...extra} {...rest}>
      {children}
    </Tag>
  );
}
