import { useQueryClient } from '@tanstack/vue-query';
import { getNetwork, metadataNetwork } from '@/networks';
import { SkinSettings, Space } from '@/types';

const DEFAULT_DOMAIN = import.meta.env.VITE_HOST || 'localhost';
const domain = window.location.hostname;

// Hardcoded whitelabel mappings for onchain spaces
const MAPPING = {
  'vanilla.box': {
    network: 'base',
    id: '0x8cF43759f3d4E72cB72cED6bd69cCe43d4428264',
    skinSettings: {
      bg_color: '#252739',
      link_color: '#91ACEE',
      text_color: '#CDD6F4',
      border_color: '#313244',
      heading_color: '#CCD3F2',
      theme: 'dark',
      logo: 'ipfs://bafkreiab7pgyo4gzvospqgrlnfp6o5d6dpq4vijnzvcf5mhwzevt4hnd2m'
    }
  }
};

const isWhiteLabel = ref(false);
const isCustomDomain = ref(domain !== DEFAULT_DOMAIN);
const failed = ref(false);
const resolved = ref(domain === DEFAULT_DOMAIN);
const space = ref<Space | null>(null);
const skinSettings = ref<SkinSettings>();

async function getSpace(domain: string): Promise<Space | null> {
  const loadSpacesParams: Record<string, string> = {};
  let spaceNetwork = metadataNetwork;

  // Resolve white label domain locally if mapping is provided
  // for easier local testing
  // e.g. VITE_WHITE_LABEL_MAPPING='127.0.0.1;s:snapshot.eth'
  const localMapping = import.meta.env.VITE_WHITE_LABEL_MAPPING;
  if (localMapping) {
    const [localDomain, localSpaceId] = localMapping.split(';');
    if (domain === localDomain) {
      const [network, id] = localSpaceId.split(':');
      spaceNetwork = network;
      loadSpacesParams.id = id;
    }
  } else if (MAPPING[domain]) {
    loadSpacesParams.id = MAPPING[domain].id;
    spaceNetwork = MAPPING[domain].network;
  } else {
    loadSpacesParams.domain = domain;
  }

  const queryClient = useQueryClient();
  const network = getNetwork(spaceNetwork);
  const space = (
    await network.api.loadSpaces({ limit: 1 }, loadSpacesParams)
  )[0];

  if (!space) return null;

  queryClient.setQueryData(
    ['spaces', 'detail', `${space.network}:${space.id}`],
    space
  );

  return space;
}

export function useWhiteLabel() {
  async function init() {
    if (resolved.value) return;

    try {
      space.value = await getSpace(domain);

      if (space.value) {
        isWhiteLabel.value = true;
        skinSettings.value =
          MAPPING[domain]?.skinSettings ||
          space.value.additionalRawData?.skinSettings;
      }
    } catch (e) {
      console.log(e);
      failed.value = true;
    } finally {
      resolved.value = true;
    }
  }

  return {
    init,
    isWhiteLabel,
    isCustomDomain,
    failed,
    space,
    skinSettings,
    resolved
  };
}
