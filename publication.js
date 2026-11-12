import {isHttps} from './update-data.js';
export const links = p => (p.merchants||[]).filter(m=>m.name&&m.verified===true&&isHttps(m.affiliateUrl)&&m.enabled!==false&&m.matchStatus!=='mismatch');
export const photoReady = p => !!(p.photo?.src&&p.photo.sourceName&&isHttps(p.photo.sourceUrl)&&isHttps(p.photo.termsUrl)&&p.photo.usageConditions&&p.photo.commercialUseAllowed===true&&p.photo.websiteUseAllowed===true&&p.photo.verified===true&&p.photo.verifiedAt);
export const presentationReady = p => !!(p.presentation?.src&&p.presentation.source==='user-supplied-social-artwork'&&p.presentation.approvedForSite===true);
export const editorialReady = p => p.editorial?.basis==='public-specifications'&&p.editorial.personallyUsed===false&&isHttps(p.editorial.specificationUrl)&&p.editorial.specificationSourceName&&p.editorial.checkedAt;
// Listed editorial entries may be shown while affiliate links are being prepared.
// Photos still require recorded permissions; supplied SNS artwork is a separate asset.
export const listed = p => p.enabled!==false&&p.isPublic!==false&&p.status==='listed'&&!!editorialReady(p);
export const publishable = p => p.enabled!==false&&p.isPublic!==false&&p.status==='published'&&links(p).length>0&&(photoReady(p)||presentationReady(p))&&!!editorialReady(p);
export const visibleProduct = p => listed(p)||publishable(p);
