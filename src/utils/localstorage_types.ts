export type Separators = {
  "Group Separator": string,
  "Domain Separator": string,
  "Domain Inner Separator": string,
  "Prefix Separator": string,
  "Suffix Separator": string,
  "Word Inner Separator": string
}

export type Counts = {
  "Character Count": number,
  "Word Count": number
}

export type SavedSettings = {
  base_domain: string,
  random: string,
  current_domain: string,
  prefix: string,
  suffix: string,
  group: string,
} | undefined

export type Url = string | undefined
export type Domains = string[] | undefined
export type Groups = string[] | undefined

export type Aliases = string[] | undefined
export type ReverseAliasOrder = boolean | undefined
export type DisableStoringAliases = boolean | undefined

export type Tabs = "create" | "aliases" | "settings";
export type DefaultTab = Tabs | undefined

export type Theme = boolean

