import {endpoints} from './endpoints.ts';
import type {Locale} from './i18n';
export const supportedVersionLabels=['4.0','4.1','4.2'] as const;
export type ApiVersion=typeof supportedVersionLabels[number];
type VersionedPage={endpointId?:string;apiVersions?:ApiVersion[];apiScope?:'route'|'webhook'};
export function apiVersions(data:VersionedPage):ApiVersion[] {
 if(data.endpointId){
  const endpoint=endpoints[data.endpointId];
  const version=endpoint?.path.match(/^\/(\d+\.\d+)\//)?.[1];
  if(!supportedVersionLabels.includes(version as ApiVersion))throw new Error('Unknown API version: '+data.endpointId);
  if(data.apiScope==='webhook'||data.apiVersions&&JSON.stringify(data.apiVersions)!==JSON.stringify([version]))throw new Error('API version metadata conflicts with endpoint: '+data.endpointId);
  return [version as ApiVersion];
 }
 if(data.apiScope==='webhook'){
  if(data.apiVersions?.length)throw new Error('Webhook delivery is not tied to a route version');
  return [];
 }
 if(!data.apiVersions?.length)throw new Error('Shared pages require apiVersions or webhook scope');
 return data.apiVersions;
}
export function apiVersionLabel(data:VersionedPage,locale:Locale='en'):string {
 const versions=apiVersions(data);
 return versions.length?'API '+versions.join(' · '):(locale==='vi'?'Webhook · Không phụ thuộc phiên bản API':'Webhook · Not tied to an API route version');
}
