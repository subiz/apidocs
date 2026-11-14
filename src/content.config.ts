import {sections} from './lib/navigation';
import {supportedVersionLabels} from './lib/api-versions';
import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
export const collections={docs:defineCollection({
 loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/docs'}),
 schema:z.object({title:z.string().min(1),description:z.string().min(1),section:z.enum(sections),order:z.number(),status:z.enum(['verified','example','draft']),endpointId:z.string().optional(),translationPending:z.boolean().optional(),sourceHash:z.string().regex(/^[a-f0-9]{64}$/),apiVersions:z.array(z.enum(supportedVersionLabels)).min(1).optional(),apiScope:z.enum(['route','webhook']).optional()})
})};
