import fetch from 'node-fetch';
import { getAuth, getName, getMetadata } from './getAuthData.js';
import { Tokens } from '../../Typings/CustomTypings.js';

export const updateMetadata = async (
  tokens: Tokens,
  type:
    | 'moderator'
    | 'owner'
    | 'support'
    | 'circusstaff'
    | 'circusadmin'
    | 'helper'
    | 'nr-owner'
    | 'nr-coowner'
    | 'nr-management'
    | 'nr-staff'
    | 'nr-helper',
) => {
  const used = getAuth(type);

  // GET/PUT /users/@me/applications/:id/role-connection
  const url = `https://discord.com/api/v10/users/@me/applications/${used.id}/role-connection`;
  console.log(tokens);
  const body: {
    platform_name: ReturnType<typeof getName>;
    metadata?: ReturnType<typeof getMetadata>;
  } = {
    platform_name: getName(type),
    metadata: getMetadata(type),
  };

  if (!body.metadata) delete body.metadata;

  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
  }
};

export default {};
