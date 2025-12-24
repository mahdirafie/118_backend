import Faculty from "./faculty.model.js";
import Department from "./department.model.js";
import PersonalAttribute from "./personal_att.model.js";
import PersonalAttributeValue from "./personal_att_val.model.js";
import User from "./user.model.js";
import FavoriteCategory from "./favorite_category.model.js";
import Contactable from "./contactable.model.js";
import Favorite from "./favorite.model.js";
import ContactInfo from "./contact_info.model.js";
import EmployeeFacultyMember from "./employee_fm.model.js";
import Employee from "./employee.model.js";
import EmployeeOperation from "./employee_operations.model.js";
import EmployeeNonFacultyMember from "./employee_nfm.model.js";
import Reminder from "./reminder.model.js";
import Group from "./group.model.js";
import GroupMembership from "./group_membership.model.js";
import SharesToGroup from "./shares_to_group.model.js";
import SharesToEmployee from "./shares_to_employee.model.js";
import Post from "./post.model.js";
import Space from "./space.model.js";
import ESPRelationship from "./esp_relationship.model.js";
import SearchHistory from './search_history.model.js';

export const applyAssociations = () => {
    // Faculty -> Department
    Faculty.hasMany(Department, { foreignKey: 'fid' });
    Department.belongsTo(Faculty, { foreignKey: 'fid' });

    // PersonalAttribute -> PersonalAttributeValue
    PersonalAttribute.hasMany(PersonalAttributeValue, { foreignKey: 'att_id' });
    PersonalAttributeValue.belongsTo(PersonalAttribute, { foreignKey: 'att_id' });

    // User -> FavoriteCategory
    User.hasMany(FavoriteCategory, { foreignKey: 'uid' });
    FavoriteCategory.belongsTo(User, { foreignKey: 'uid' });

    // FavoriteCategory <-> Contactable
    FavoriteCategory.belongsToMany(Contactable, { through: Favorite, foreignKey: 'favcat_id', otherKey: 'cid' });
    Contactable.belongsToMany(FavoriteCategory, { through: Favorite, foreignKey: 'cid', otherKey: 'favcat_id' });

    // Contactable -> ContactInfo
    Contactable.hasMany(ContactInfo, { foreignKey: 'cid' });
    ContactInfo.belongsTo(Contactable, { foreignKey: 'cid' });

    // User -> Employee
    User.hasOne(Employee, { foreignKey: 'uid' });
    Employee.belongsTo(User, { foreignKey: 'uid' });

    // Contactable -> Employee
    Contactable.hasOne(Employee, { foreignKey: 'cid' });
    Employee.belongsTo(Contactable, { foreignKey: 'cid' });

    // Employee -> EmployeeFacultyMember / EmployeeNonFacultyMember
    Employee.hasOne(EmployeeFacultyMember, { foreignKey: 'emp_id' });
    EmployeeFacultyMember.belongsTo(Employee, { foreignKey: 'emp_id' });

    Employee.hasOne(EmployeeNonFacultyMember, { foreignKey: 'emp_id' });
    EmployeeNonFacultyMember.belongsTo(Employee, { foreignKey: 'emp_id' });

    // EmployeeFacultyMember -> Department
    Department.hasMany(EmployeeFacultyMember, { foreignKey: 'did' });
    EmployeeFacultyMember.belongsTo(Department, { foreignKey: 'did' });

    // Employee -> EmployeeOperation
    Employee.hasMany(EmployeeOperation, { foreignKey: 'emp_id' });
    EmployeeOperation.belongsTo(Employee, { foreignKey: 'emp_id' });

    // Employee -> PersonalAttributeValue
    Employee.hasMany(PersonalAttributeValue, { foreignKey: 'emp_id', as: 'ownerAttVal' });
    PersonalAttributeValue.belongsTo(Employee, { foreignKey: 'emp_id', as: 'owner' });

    // Employee <-> Contactable (Reminder)
    Employee.belongsToMany(Contactable, { through: Reminder, foreignKey: 'emp_id', otherKey: 'cid' });
    Contactable.belongsToMany(Employee, { through: Reminder, foreignKey: 'cid', otherKey: 'emp_id' });

    // Employee <-> Group (GroupMembership)
    Employee.belongsToMany(Group, { through: GroupMembership, foreignKey: 'emp_id', otherKey: 'gid', as: 'memberGroups' });
    Group.belongsToMany(Employee, { through: GroupMembership, foreignKey: 'gid', otherKey: 'emp_id', as: 'members' });

    Employee.hasMany(Group, {
        foreignKey: 'emp_id',
        as: 'ownedGroups'
    });

    Group.belongsTo(Employee, {
        foreignKey: 'emp_id',
        as: 'owner'
    });

    GroupMembership.belongsTo(Group, { foreignKey: 'gid', as: 'Group' });
    Group.hasMany(GroupMembership, { foreignKey: 'gid', as: 'memberships' });


    // PersonalAttributeValue can be shared to many employees
    PersonalAttributeValue.belongsToMany(Employee, {
        through: SharesToEmployee,
        foreignKey: 'val_id',
        otherKey: 'receiver_emp_id',
        as: 'sharedWithEmployees',
    });

    // Employee can receive many personal attribute values
    Employee.belongsToMany(PersonalAttributeValue, {
        through: SharesToEmployee,
        foreignKey: 'receiver_emp_id',
        otherKey: 'val_id',
        as: 'receivedAttributeValuesEmps',
    });

    // PersonalAttributeValue can be shared to many Groups
    PersonalAttributeValue.belongsToMany(Group, {
        through: SharesToGroup,
        foreignKey: 'val_id',
        otherKey: 'gid',
        as: 'sharedWithGroups',
    });

    // Group can receive many personal attribute values
    Group.belongsToMany(PersonalAttributeValue, {
        through: SharesToGroup,
        foreignKey: 'gid',
        otherKey: 'val_id',
        as: 'receivedAttributeValuesGroups',
    });


    // Contactable -> Post
    Contactable.hasOne(Post, { foreignKey: 'cid' });
    Post.belongsTo(Contactable, { foreignKey: 'cid' });

    // Contactable -> Space
    Contactable.hasOne(Space, { foreignKey: 'cid' });
    Space.belongsTo(Contactable, { foreignKey: 'cid' });

    // ESPRelationship ternary relationship
    ESPRelationship.belongsTo(Employee, { foreignKey: 'emp_id' });
    ESPRelationship.belongsTo(Post, { foreignKey: 'pid' });
    ESPRelationship.belongsTo(Space, { foreignKey: 'sid' });

    Employee.hasMany(ESPRelationship, { foreignKey: 'emp_id' });
    Post.hasMany(ESPRelationship, { foreignKey: 'pid' });
    Space.hasMany(ESPRelationship, { foreignKey: 'sid' });

    // User and SearchHistory relationship
    User.hasMany(SearchHistory, { foreignKey: 'uid' });
    SearchHistory.belongsTo(User, { foreignKey: 'uid' });

    // Faculty and Space relationship(filtering purpose)
    Faculty.hasMany(Space, { foreignKey: 'fid' });
    Space.belongsTo(Faculty, { foreignKey: 'fid' });

    // Faculty and Post relationship(filtering purpose)
    Faculty.hasMany(Post, { foreignKey: 'fid' });
    Post.belongsTo(Faculty, { foreignKey: 'fid' });
};
