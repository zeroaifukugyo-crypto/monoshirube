export function postNumber(value){const match=String(value).trim().normalize('NFKC').match(/^#?\s*(\d{1,2})$/);return match&&Number(match[1])>0?String(Number(match[1])).padStart(2,'0'):null;}
