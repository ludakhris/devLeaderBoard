import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const devs = [
  { id: 11,
    sid: 'lnharve',
    email: 'a@aol.com',
    pkiDn: 'CN=XXXXX, OU=Agency, OU=ABC',
    name: 'Les Harvey',
    lastActivity:  new Date(1988, 3, 15) },
  { id: 12,
    sid: 'jpcasti',
    email: 'c@aol.com',
    pkiDn: 'CN=YYYY, OU=Agency, OU=ABC',
    name: 'John Castilano',
    lastActivity:  new Date(2002, 10, 20) },
  { id: 13,
    sid: 'cghowa2',
    email: 'cg@aol.com',
    pkiDn: 'CN=CCCCC, OU=Agency, OU=ABC',
    name: 'Chris Howard',
    lastActivity:  new Date(1982, 10, 20) },
  { id: 14,
    sid: 'kmrosso',
    email: 'k@aol.com',
    pkiDn: 'CN=KKK, OU=Agency, OU=ABC',
    name: 'Kevin Rosso',
    lastActivity:  new Date(1955, 5, 5) },
  { id: 15,
    sid: 'cmrusso',
    email: 'CMR@aol.com',
    pkiDn: 'CN=CMRU, OU=Agency, OU=ABC',
    name: 'Chris Russo',
    lastActivity:  new Date(1985, 12, 15) },
  { id: 16,
    sid: 'revinso',
    email: 'R@aol.com',
    pkiDn: 'CN=RRRR, OU=Agency, OU=ABC',
    name: 'Ryan Vinson',
    lastActivity:  new Date(2002, 3, 10) }
    ];
    return {devs};
  }
}
