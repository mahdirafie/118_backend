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
    FavoriteCategory.belongsToMany(Contactable, { through: Favorite });
    Contactable.belongsToMany(FavoriteCategory, { through: Favorite });

    // Contactable -> ContactInfo
    Contactable.hasMany(ContactInfo, { foreignKey: 'cid' });
    ContactInfo.belongsTo(Contactable, { foreignKey: 'cid' });

    // User -> Employee
    User.hasOne(Employee, { foreignKey: 'uid' });
    Employee.belongsTo(User, { foreignKey: 'uid' });

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
    Employee.hasMany(PersonalAttributeValue, { foreignKey: 'emp_id' });
    PersonalAttributeValue.belongsTo(Employee, { foreignKey: 'emp_id' });

    // Employee <-> Contactable (Reminder)
    Employee.belongsToMany(Contactable, { through: Reminder });
    Contactable.belongsToMany(Employee, { through: Reminder });

    // Employee <-> Group (GroupMembership)
    Employee.belongsToMany(Group, { through: GroupMembership });
    Group.belongsToMany(Employee, { through: GroupMembership });

    // SharesToGroup ternary relationship
    SharesToGroup.belongsTo(Employee, { foreignKey: 'emp_id' });
    SharesToGroup.belongsTo(Group, { foreignKey: 'gid' });
    SharesToGroup.belongsTo(PersonalAttributeValue, { foreignKey: 'val_id' });

    Employee.hasMany(SharesToGroup, { foreignKey: 'emp_id' });
    Group.hasMany(SharesToGroup, { foreignKey: 'gid' });
    PersonalAttributeValue.hasMany(SharesToGroup, { foreignKey: 'val_id' });

    // SharesToEmployee ternary relationship with aliases
    SharesToEmployee.belongsTo(Employee, { foreignKey: 'emp_id', as: 'sender' });
    SharesToEmployee.belongsTo(Employee, { foreignKey: 'receiver_emp_id', as: 'receiver' });
    SharesToEmployee.belongsTo(PersonalAttributeValue, { foreignKey: 'val_id' });

    Employee.hasMany(SharesToEmployee, { foreignKey: 'emp_id', as: 'empSender' });
    Employee.hasMany(SharesToEmployee, { foreignKey: 'receiver_emp_id', as: 'empReceiver' });
    PersonalAttributeValue.hasMany(SharesToEmployee, { foreignKey: 'val_id' });

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
};
