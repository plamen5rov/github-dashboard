export interface LicenseInfo {
  spdxId: string
  name: string
  description: string
  category: 'permissive' | 'copyleft' | 'public-domain' | 'other'
}

export const LICENSE_LEGEND: LicenseInfo[] = [
  {
    spdxId: 'MIT',
    name: 'MIT License',
    description: 'Do anything, just keep the copyright notice',
    category: 'permissive',
  },
  {
    spdxId: 'Apache-2.0',
    name: 'Apache License 2.0',
    description: 'Like MIT, plus explicit patent protection',
    category: 'permissive',
  },
  {
    spdxId: 'BSD-2-Clause',
    name: 'BSD 2-Clause "Simplified"',
    description: 'Permissive, minimal restrictions',
    category: 'permissive',
  },
  {
    spdxId: 'BSD-3-Clause',
    name: 'BSD 3-Clause "New"',
    description: 'Permissive, no endorsement without permission',
    category: 'permissive',
  },
  {
    spdxId: 'ISC',
    name: 'ISC License',
    description: 'Functionally equivalent to MIT',
    category: 'permissive',
  },
  {
    spdxId: 'GPL-2.0',
    name: 'GNU General Public License 2.0',
    description: 'Derivative works must also be GPL-2.0',
    category: 'copyleft',
  },
  {
    spdxId: 'GPL-3.0',
    name: 'GNU General Public License 3.0',
    description: 'Derivative works must also be GPL-3.0',
    category: 'copyleft',
  },
  {
    spdxId: 'LGPL-2.1',
    name: 'GNU Lesser General Public License 2.1',
    description: 'Weaker copyleft, linking allowed',
    category: 'copyleft',
  },
  {
    spdxId: 'LGPL-3.0',
    name: 'GNU Lesser General Public License 3.0',
    description: 'Weaker copyleft, linking allowed',
    category: 'copyleft',
  },
  {
    spdxId: 'AGPL-3.0',
    name: 'GNU Affero General Public License 3.0',
    description: 'GPL + network use triggers source distribution',
    category: 'copyleft',
  },
  {
    spdxId: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    description: 'File-level copyleft, mixed with proprietary OK',
    category: 'copyleft',
  },
  {
    spdxId: 'Unlicense',
    name: 'The Unlicense',
    description: 'Public domain, no restrictions',
    category: 'public-domain',
  },
  {
    spdxId: 'CC0-1.0',
    name: 'Creative Commons Zero 1.0',
    description: 'Public domain dedication',
    category: 'public-domain',
  },
  {
    spdxId: 'BSL-1.0',
    name: 'Boost Software License 1.0',
    description: 'Permissive, copyright notice required',
    category: 'permissive',
  },
  {
    spdxId: 'Zlib',
    name: 'zlib License',
    description: 'Permissive, modified versions must be marked',
    category: 'permissive',
  },
]

const ADDITIONAL_OSI = ['Artistic-2.0', 'EPL-1.0', 'EPL-2.0', 'EUPL-1.1', 'EUPL-1.2', 'OFL-1.1', 'WTFPL', '0BSD', 'BlueOak-1.0.0']

export const OSI_LICENSE_IDS = new Set([
  ...LICENSE_LEGEND.map((l) => l.spdxId),
  ...ADDITIONAL_OSI,
])

export const CATEGORY_LABELS: Record<LicenseInfo['category'], string> = {
  permissive: 'Permissive',
  copyleft: 'Copyleft',
  'public-domain': 'Public Domain',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<LicenseInfo['category'], string> = {
  permissive: 'text-green-400',
  copyleft: 'text-orange-400',
  'public-domain': 'text-blue-400',
  other: 'text-github-muted',
}
