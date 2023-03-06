import Ajv from 'ajv';
import { validateAndParseAddress } from 'starknet';
import { isAddress } from '@ethersproject/address';
import { parseUnits } from '@ethersproject/units';
import { Zero, MinInt256, MaxInt256, MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';

export function validateForm(schema, form): Record<string, string> {
  const ajv = new Ajv({ allErrors: true });

  ajv.addFormat('address', {
    validate: (value: string) => {
      try {
        return !!validateAndParseAddress(value);
      } catch (err) {
        return isAddress(value);
      }
    }
  });

  ajv.addFormat('long', {
    validate: () => true
  });

  ajv.addFormat('uint256', {
    validate: value => {
      if (!value.match(/^([0-9]|[1-9][0-9]+)$/)) return false;

      try {
        const number = BigNumber.from(value);
        return number.gte(Zero) && number.lte(MaxUint256);
      } catch {
        return false;
      }
    }
  });

  ajv.addFormat('ethValue', {
    validate: value => {
      if (!value.match(/^([0-9]|[1-9][0-9]+)(\.[0-9]+)?$/)) return false;

      try {
        parseUnits(value, 18);
        return true;
      } catch {
        return false;
      }
    }
  });

  ajv.addFormat('int256', {
    validate: value => {
      if (!value.match(/^-?([0-9]|[1-9][0-9]+)$/)) return false;

      try {
        const number = BigNumber.from(value);
        return number.gte(MinInt256) && number.lte(MaxInt256);
      } catch {
        return false;
      }
    }
  });

  ajv.validate(schema, form);

  const output = {};
  if (!ajv.errors) {
    return output;
  }

  for (const error of ajv.errors) {
    const path = error.instancePath.split('/').slice(1);

    let current = output;
    for (let i = 0; i < path.length - 1; i++) {
      const subpath = path[i];
      if (!current[subpath]) current[subpath] = {};
      current = current[subpath];
    }

    current[path[path.length - 1]] = 'Invalid field';
  }

  return output;
}