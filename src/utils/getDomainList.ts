import { DomainName } from "./name-service"

export const getDomainList = (
  domainNames: (DomainName | undefined)[] | undefined
) => {
  // removed list for the time being
  // return domainNames?.map((domain, idx) =>
  //   domainNames[idx]?.name && idx + 1 < domainNames?.length
  //     ? `${domain?.name.toUpperCase()}.SOL, `
  //     : `${domain?.name.toUpperCase()}.SOL`
  // );
  const orderedDomains = domainNames?.sort((a, b) =>
    a?.name === b?.name ? 0 : a?.name < b?.name ? -1 : 1
  )

  return orderedDomains && [`${orderedDomains[0]?.name.toUpperCase()}`]
}
