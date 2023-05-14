import auth from '../../auth.json' assert { type: 'json' };
import type { RawUser } from '../../../submodules/Ayako-v1.6/src/Typings/CustomTypings';

export const getAuth = (
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
  switch (type) {
    case 'moderator': {
      return auth.animekosModerators;
    }
    case 'owner': {
      return auth.animekosOwner;
    }
    case 'support': {
      return auth.ayakoSupport;
    }
    case 'circusstaff': {
      return auth.circusStaff;
    }
    case 'circusadmin': {
      return auth.circusAdmin;
    }
    case 'helper': {
      return auth.animekosHelper;
    }
    case 'nr-owner': {
      return auth.nrOwner;
    }
    case 'nr-coowner': {
      return auth.nrCoOwner;
    }
    case 'nr-management': {
      return auth.nrManagement;
    }
    case 'nr-staff': {
      return auth.nrStaff;
    }
    case 'nr-helper': {
      return auth.nrHelper;
    }
    default: {
      return auth.ayakoOwner;
    }
  }
};

export const getName = (
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
  switch (type) {
    case 'moderator': {
      return 'Animekos Moderator';
    }
    case 'support': {
      return 'Ayako Support';
    }
    case 'owner': {
      return 'Animekos Owner';
    }
    case 'circusstaff': {
      return 'Circus Staff';
    }
    case 'circusadmin': {
      return 'Admin';
    }
    case 'helper': {
      return 'Animekos Helper';
    }
    case 'nr-owner': {
      return 'Owner';
    }
    case 'nr-coowner': {
      return 'Co-Owner';
    }
    case 'nr-management': {
      return 'Management';
    }
    case 'nr-staff': {
      return 'Staff';
    }
    case 'nr-helper': {
      return 'Helper';
    }
    default: {
      return 'Ayako Developer';
    }
  }
};

export const getAvatar = (user: RawUser) => {
  if (!user.avatar) return 'https://cdn.discordapp.com/embed/avatars/1.png';

  if (user.avatar.startsWith('a_')) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif`;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
};
