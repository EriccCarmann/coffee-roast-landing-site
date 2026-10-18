// Link-style button. The t-btnflex* classes are left over from Tilda: the section CSS relies on them (see styles/global.css).
export default function Button({ as: Tag = 'a', size = 'md', className = '', children, ...rest }) {
  return (
    <Tag className={`t-btnflex t-btnflex_${size} ${className}`} {...rest}>
      <span className="t-btnflex__text">{children}</span>
    </Tag>
  );
}
