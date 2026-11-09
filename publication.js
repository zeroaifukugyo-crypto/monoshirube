import {isHttps} from './update-data.js';
export const links = p => (p.merchants||[]).filter(m=>m.name&&m.verified===true&&isHttps(m.affiliateUrl));
export const photoReady = p => !!(p.photo?.src&&p.photo.sourceName&&isHttps(p.photo.sourceUrl)&&isHttps(p.photo.termsUrl)&&p.photo.usageConditions&&p.photo.commercialUseAllowed===true&&p.photo.websiteUseAllowed===true&&p.photo.verified===true&&p.photo.verifiedAt);
export const editorialReady = p => p.editorial?.basis==='public-specifications'&&p.editorial.personallyUsed===false&&isHttps(p.editorial.specificationUrl)&&p.editorial.specificationSourceName&&p.editorial.checkedAt;
export const publishable = p => p.status==='published'&&links(p).length>0&&photoReady(p)&&!!editorialReady(p);
