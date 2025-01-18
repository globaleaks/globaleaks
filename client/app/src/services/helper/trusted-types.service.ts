// trusted-types.service.ts
import { Injectable } from '@angular/core';
import * as DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class TrustedTypesService {
  constructor() {
    if (window.trustedTypes) {
      window.trustedTypes.createPolicy('default', {
        createHTML: (input: string) => {
          // Sanitize the input using DOMPurify or any other sanitizer library
          return (DOMPurify as any).default.sanitize(input, {RETURN_TRUSTED_TYPE: true});
        },
        createScript: (input: string) => {
          throw new Error('Scripts are not allowed by this policy.');
        },
        createScriptURL: (input: string) => {
          throw new Error('Script URLs are not allowed by this policy.');
        }
      });
    }
  }
}
