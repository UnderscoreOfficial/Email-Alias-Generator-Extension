import { parse } from "tldts";
import { generate } from "random-words";

export function generateAlias({ base_domain, random, current_domain, prefix, suffix, group, separators, counts, url }) {
  if (!base_domain || !base_domain.trim()) {
    return "";
  }

  function randomString(length: number) {
    let _string = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let i = 0;
    while (i <= length) {
      _string += characters.charAt(Math.floor(Math.random() * characters.length));
      i += 1;
    }
    return _string;
  }

  function formatRandom() {
    switch (random) {
      case "Random Characters":
        return randomString(counts["Character Count"]);
      case "Random Words":
        return generate({ exactly: counts["Word Count"], join: separators["Word Inner Separator"] });
      default:
        return "";
    }
  }

  function formatDomain() {
    const _url = parse(url);
    if (!_url.domain && current_domain != "None") {
      let _formated = url.replace(/:\/\/|:/g, separators["Domain Inner Separator"]).replace("#", "");
      try {
        _formated = _formated.split("/")[0];
      } catch (e) { console.error(e); };

      return `${_formated}`;
    }
    switch (current_domain) {
      case "Base Domain":
        return `${_url?.domain.replace(".", separators["Domain Inner Separator"])}`;
      case "Domain":
        return `${_url?.domainWithoutSuffix.replace(".", separators["Domain Inner Separator"])}`;
      case "Full Domain":
        return `${_url?.hostname.replace(".", separators["Domain Inner Separator"])}`;
      default:
        return "";
    }
  }

  function formated() {
    const _prefix = prefix.trim(); // has separator
    const _group = group.trim(); // has separator
    const _cdomain = formatDomain(); // has separator
    const _random = formatRandom();
    const _suffix = suffix.trim(); // has separator (unique)
    const _bdomain = base_domain.trim();

    let _generated = "";

    // ugh I really cannot think of a better way of doing this while accounting for customizable separators / fields and avoiding duplicate separators
    if (_prefix.length) {
      if (_group.length || _cdomain.length || _random.length || _suffix.length) {
        _generated += `${_prefix}${separators["Prefix Separator"]}`;
      } else {
        _generated += _prefix;
      }
    }
    if (_group.length) {
      if (_cdomain.length || _random.length || _suffix.length) {
        _generated += `${_group}${separators["Group Separator"]}`;
      } else {
        _generated += _group;
      }
    }
    if (_cdomain.length) {
      if (_random.length || _suffix.length) {
        _generated += `${_cdomain}${separators["Domain Separator"]}`;
      } else {
        _generated += _cdomain;
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
