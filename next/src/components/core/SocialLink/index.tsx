import { iconsRegistry } from './icons';

export default async function SocialLink(props: SocialLinkProps) {
  const IconComponent =
    await iconsRegistry[props.service as keyof typeof iconsRegistry]?.();

  if (!IconComponent) return null;

  const Icon = IconComponent.default;
  if (!Icon) return null;

  return (
    <li className="supt-social-link">
      <a href={props.url} target="_blank" rel="noopener noreferrer">
        <Icon />
      </a>
    </li>
  );
}
