import { parse } from "tldts";
import { generate } from "random-words";
import type { Counts, Separators, Url } from "./localstorage_types";

type Params = {
  base_domain: string,
  random: string[],
  current_domain: string[],
  prefix: string,
  suffix: string,
  group: string,
  separators: Separators,
  counts: Counts,
  url: Url
}

export function generateAlias({ base_domain, random, current_domain, prefix, suffix, group, separators, counts, url }: Params) {
  if (!base_domain || !base_domain.trim()) {
    return "";
  }

  function randomString(length: number) {
    let _string = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let i = 0;
    while (i < length) {
      _string += characters.charAt(Math.floor(Math.random() * characters.length));
      i += 1;
    }
    return _string;
  }

  function formatRandom() {
    const random_values = [];
    for (const random_type of random) {
      switch (random_type) {
        case "Characters":
          random_values.push(randomString(counts["Character Count"]));
          break;
        case "Words":
          random_values.push(generate({ exactly: counts["Word Count"], join: separators["Word Inner Separator"] }));
          break;
      }
    }
    return random_values.join(separators["Word Inner Separator"]);
  }

  function formatCurrentDomain() {
    if (!url) return "";
    if (!current_domain) return "";

    const _url = parse(url);

    // for local browser urls like chrome://settings or about:preferences
    if (!_url.domain && current_domain.length) {
      let _formated = url.replace(/:\/\/|:/g, ".").replace("#", "");
      try {
        _formated = _formated.split("/")[0] || _formated;
      } catch (e) { console.error(e); };
      const domain_parts = _formated.split(".");

      const selected_domain_parts = [];
      for (const url_selection in current_domain) {
        switch (current_domain[url_selection]) {
          case "Subdomain":
            if (domain_parts[0]) {
              selected_domain_parts.push(domain_parts[0]);
            }
            break;
          case "Domain":
            if (domain_parts[1]) {
              selected_domain_parts.push(domain_parts[1]);
            }
            break;
        }
      }
      return selected_domain_parts.join(separators["Domain Inner Separator"]);
    }

    const selected_domain_parts = [];
    for (const url_selection in current_domain) {
      switch (current_domain[url_selection]) {
        case "Subdomain":
          if (_url.subdomain) {
            selected_domain_parts.push(_url.subdomain);
          }
          break;
        case "Domain":
          if (_url.domainWithoutSuffix) {
            selected_domain_parts.push(_url.domainWithoutSuffix);
          }
          break;
        case "Top Level Domain":
          if (_url.publicSuffix) {
            selected_domain_parts.push(_url.publicSuffix);
          }
          break;
      }
    }
    return selected_domain_parts.join(separators["Domain Inner Separator"]);
  }

  function formated() {
    const _prefix = prefix.trim(); // has separator
    const _group = group.trim(); // has separator
    const _current_domain = formatCurrentDomain() || ""; // has separator
    const _random = formatRandom();
    const _suffix = suffix.trim(); // has separator (unique)
    const _bdomain = base_domain.trim();

    let _generated = "";

    // ugh I really cannot think of a better way of doing this while accounting for customizable separators / fields and avoiding duplicate separators
    if (_prefix.length) {
      if (_group.length || _current_domain.length || _random.length || _suffix.length) {
        _generated += `${_prefix}${separators["Prefix Separator"]}`;
      } else {
        _generated += _prefix;
      }
    }
    if (_group.length) {
      if (_current_domain.length || _random.length || _suffix.length) {
        _generated += `${_group}${separators["Group Separator"]}`;
      } else {
        _generated += _group;
      }
    }
    if (_current_domain.length) {
      if (_random.length || _suffix.length) {
        _generated += `${_current_domain}${separators["Domain Separator"]}`;
      } else {
        _generated += _current_domain;
      }
    }
    if (_random.length) {
      _generated += _random;
    }
    if (_suffix.length) {
      if (_random.length) {
        _generated += `${separators["Suffix Separator"]}${_suffix}`;
      } else {
        _generated += _suffix;
      }
    }

    const _final = `${_generated}@${_bdomain}`;

    return _final;
  }
  return formated();
}
