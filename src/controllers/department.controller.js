import Department from '../model/department.model.js';
import logger from '../utils/logger.js';

class DepartmentController {
  getDepartments = async (req, res) => {
    try {
      const departments = await Department.find();
      res.json(departments);
    } catch (err) {
      logger.error(`Error retrieving departments: ${err.message}`);
      res.status(500).send('Server Error');
    }
  };

  // Get department by code
  getDepartmentByCode = async (req, res) => {
    try {
      const department = await Department.findOne({ code: req.params.code });

      if (!department) {
        logger.warn(`Department not found with code: ${req.params.code}`);
        return res.status(404).json({ msg: 'Department not found' });
      }

      res.json(department);
    } catch (err) {
      logger.error(`Error retrieving department by code: ${err.message}`);
      res.status(500).send('Server Error');
    }
  };

  getDepartmentsByFaculty = async (req, res) => {
    try {
      const { facultyId } = req.params;

      const departments = await Department.find({ faculty: facultyId });

      if (!departments.length) {
        logger.warn(`No departments found for faculty ID: ${facultyId}`);
        return res
          .status(404)
          .json({ msg: 'No departments found for this faculty' });
      }

      res.json(departments);
    } catch (err) {
      logger.error(`Error retrieving departments by faculty: ${err.message}`);
      res.status(500).send('Server Error');
    }
  };

  getDepartmentsByFacultyCode = async (req, res) => {
    try {
      const { facultyCode } = req.params;

      const departments = await Department.find({ faculty: facultyCode });

      if (!departments.length) {
        logger.warn(`No departments found for faculty code: ${facultyCode}`);
        return res
          .status(404)
          .json({ msg: 'No departments found for this faculty' });
      }

      res.json(departments);
    } catch (err) {
      logger.error(
        `Error retrieving departments by faculty code: ${err.message}`
      );
      res.status(500).send('Server Error');
    }
  };
}

export default new DepartmentController();
