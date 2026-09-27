import {Globe, MessageCircle, Send, Tag, type LucideIcon} from 'lucide-react';
import type {ChannelId} from '../../config/integrations';
import './ChannelIcon.css';

/**
 * Channel icon with an asset slot: drop the official file into resources/images/marketing/channels/<id>.(svg|png|webp)
 * and it is used automatically. Until then a neutral icon stands in — brand logos are never drawn by hand.
 */
const assets = import.meta.glob<string>('../../../../images/marketing/channels/*.{svg,png,webp}', {eager: true, import: 'default'});

function assetFor(id: ChannelId): string | undefined {
  const key = Object.keys(assets).find(path => new RegExp(`/${id}\\.(svg|png|webp)$`).test(path));
  return key ? assets[key] : undefined;
}

const fallback: Record<ChannelId, LucideIcon> = {
  avito: Tag,
  telegram: Send,
  max: MessageCircle,
  site: Globe,
};

export function ChannelIcon({id, size = 18}: {id: ChannelId; size?: number}) {
  const src = assetFor(id);
  if (src) return <img className="mk-channel-icon" src={src} alt="" width={size} height={size} decoding="async"/>;
  const Icon = fallback[id];
  return (
    <span className="mk-channel-icon mk-channel-icon--fallback" data-channel={id} aria-hidden="true" style={{width: size + 10, height: size + 10}}>
      <Icon size={size - 4} strokeWidth={2}/>
    </span>
  );
}
