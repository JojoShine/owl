const express = require('express');
const router = express.Router();
const departmentController = require('./department.controller');
const { authenticate } = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const departmentValidation = require('./department.validation');

/**
 * @route GET /api/departments/tree
 * @desc 获取部门树
 * @access Private - 已认证用户
 */
router.get(
  '/tree',
  authenticate,
  departmentController.getDepartmentTree
);

/**
 * @route GET /api/departments/:id/members
 * @desc 获取部门成员
 * @access Private - 已认证用户
 */
router.get(
  '/:id/members',
  authenticate,
  validate(departmentValidation.getDepartmentById),
  departmentController.getDepartmentMembers
);

/**
 * @route GET /api/departments/:id
 * @desc 获取部门详情
 * @access Private - 已认证用户
 */
router.get(
  '/:id',
  authenticate,
  validate(departmentValidation.getDepartmentById),
  departmentController.getDepartmentById
);

/**
 * @route GET /api/departments
 * @desc 获取部门列表
 * @access Private - 已认证用户
 */
router.get(
  '/',
  authenticate,
  validate(departmentValidation.getDepartments),
  departmentController.getDepartments
);

/**
 * @route POST /api/departments
 * @desc 创建部门
 * @access Private - 需要admin权限
 */
router.post(
  '/',
  authenticate,
  validate(departmentValidation.createDepartment),
  departmentController.createDepartment
);

/**
 * @route PUT /api/departments/:id
 * @desc 更新部门
 * @access Private - 需要admin权限
 */
router.put(
  '/:id',
  authenticate,
  validate(departmentValidation.updateDepartment),
  departmentController.updateDepartment
);

/**
 * @route DELETE /api/departments/:id
 * @desc 删除部门
 * @access Private - 需要admin权限
 */
router.delete(
  '/:id',
  authenticate,
  validate(departmentValidation.deleteDepartment),
  departmentController.deleteDepartment
);

module.exports = router;