const recommendationService = require('../services/recommendationService');

exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user.student_id;
    const schoolId = req.schoolId;

    const insights = await recommendationService.calculateCareerMatches(studentId, schoolId);

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};
