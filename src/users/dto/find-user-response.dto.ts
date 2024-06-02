import { OrganisationAttributes, UserAttributes } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  active: boolean;

  @Expose()
  termsAndConditionsAccepted: boolean;

  @Expose()
  @Type(() => UserAttributesDTO)
  userAttributes: UserAttributes;

  @Expose()
  @Type(() => OrganisationAttributesDTO)
  organisationAttributes: OrganisationAttributes;
}

class UserAttributesDTO {
  @Expose()
  firstname: string;

  @Expose()
  lastname: string;

  @Expose()
  city: string;

  @Expose()
  phone: string;

  @Expose()
  type: string;
}

class OrganisationAttributesDTO {
  @Expose()
  name: string;

  @Expose()
  city: string;

  @Expose()
  street: string;

  @Expose()
  oib: string;
}
