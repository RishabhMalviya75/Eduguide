const { Activity, ActivityRegistration, Student, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/activities
 * List activities with filters (category, date, search, location, joinedOnly)
 */
async function getActivities(req, res) {
  const { category, search, date, location, joinedOnly, status } = req.query;

  const queryFilter = {};

  if (status && status !== 'all') {
    queryFilter.status = status;
  } else if (!status) {
    queryFilter.status = 'active';
  }

  if (category) {
    queryFilter.category = category;
  }

  if (location) {
    queryFilter.location = { $regex: location, $options: 'i' };
  }

  if (search) {
    queryFilter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  if (date) {
    const searchDate = new Date(date);
    if (!isNaN(searchDate.getTime())) {
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      queryFilter.date = { $gte: startOfDay, $lte: endOfDay };
    }
  }

  const activities = await Activity.find(queryFilter)
    .sort({ date: 1, created_at: -1 })
    .setOptions({ schoolId: req.schoolId });

  // Get student info if user is a Student
  let currentStudent = null;
  if (req.user.role === 'Student' && req.user.student_id) {
    currentStudent = await Student.findById(req.user.student_id).setOptions({
      schoolId: req.schoolId,
    });
  }

  // Attach dynamic metadata (participants count, student join status, eligibility match)
  const activityIds = activities.map((a) => a._id);
  const registrations = await ActivityRegistration.find({
    activity_id: { $in: activityIds },
    status: 'registered',
  }).setOptions({ schoolId: req.schoolId });

  const participantCounts = {};
  const studentJoinedMap = {};

  registrations.forEach((reg) => {
    const actIdStr = reg.activity_id.toString();
    participantCounts[actIdStr] = (participantCounts[actIdStr] || 0) + 1;

    if (
      currentStudent &&
      reg.student_id.toString() === currentStudent._id.toString()
    ) {
      studentJoinedMap[actIdStr] = true;
    }
  });

  let results = activities.map((act) => {
    const actObj = act.toObject();
    const actIdStr = act._id.toString();
    const count = participantCounts[actIdStr] || 0;
    const isJoined = Boolean(studentJoinedMap[actIdStr]);

    let isEligible = true;
    let eligibilityReason = '';

    if (currentStudent && act.eligibility && act.eligibility.grades?.length > 0) {
      if (!act.eligibility.grades.includes(currentStudent.grade)) {
        isEligible = false;
        eligibilityReason = `Only for Grade ${act.eligibility.grades.join(', ')} (Your Grade: ${currentStudent.grade})`;
      }
    }

    const isFull = act.maxParticipants ? count >= act.maxParticipants : false;
    const isDeadlinePassed = act.registrationDeadline
      ? new Date() > new Date(act.registrationDeadline)
      : false;

    return {
      ...actObj,
      currentParticipantsCount: count,
      isJoined,
      isEligible,
      eligibilityReason,
      isFull,
      isDeadlinePassed,
    };
  });

  if (joinedOnly === 'true' && req.user.role === 'Student') {
    results = results.filter((item) => item.isJoined);
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
}

/**
 * GET /api/activities/:id
 * Get single activity by ID
 */
async function getActivityById(req, res) {
  const activity = await Activity.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  const count = await ActivityRegistration.countDocuments({
    activity_id: activity._id,
    status: 'registered',
  }).setOptions({ schoolId: req.schoolId });

  let isJoined = false;
  let isEligible = true;
  let eligibilityReason = '';
  let currentStudentGrade = null;

  if (req.user.role === 'Student' && req.user.student_id) {
    const currentStudent = await Student.findById(req.user.student_id).setOptions({
      schoolId: req.schoolId,
    });

    if (currentStudent) {
      currentStudentGrade = currentStudent.grade;
      const reg = await ActivityRegistration.findOne({
        activity_id: activity._id,
        student_id: currentStudent._id,
        status: 'registered',
      }).setOptions({ schoolId: req.schoolId });

      isJoined = Boolean(reg);

      if (activity.eligibility?.grades?.length > 0) {
        if (!activity.eligibility.grades.includes(currentStudent.grade)) {
          isEligible = false;
          eligibilityReason = `Only for Grade ${activity.eligibility.grades.join(', ')} (Your Grade: ${currentStudent.grade})`;
        }
      }
    }
  }

  const isFull = activity.maxParticipants ? count >= activity.maxParticipants : false;
  const isDeadlinePassed = activity.registrationDeadline
    ? new Date() > new Date(activity.registrationDeadline)
    : false;

  res.json({
    success: true,
    data: {
      ...activity.toObject(),
      currentParticipantsCount: count,
      isJoined,
      isEligible,
      eligibilityReason,
      isFull,
      isDeadlinePassed,
      currentStudentGrade,
    },
  });
}

/**
 * POST /api/activities
 * Create a new activity (Teacher or Admin)
 */
async function createActivity(req, res) {
  const {
    title,
    category,
    description,
    date,
    time,
    location,
    eligibilityGrades,
    eligibilityText,
    maxParticipants,
    registrationDeadline,
    registrationDetails,
  } = req.body;

  if (!title || !category || !description || !date || !time || !location || !registrationDeadline) {
    throw new ApiError(
      400,
      'Title, category, description, date, time, location, and registration deadline are required.'
    );
  }

  // Fetch organizer user details
  let organizerName = req.user.name || 'Organizer';
  let organizerEmail = req.user.email || '';
  
  const user = await User.findById(req.user.user_id || req.user.id).setOptions({
    schoolId: req.schoolId,
  });
  if (user) {
    organizerName = user.name;
    organizerEmail = user.email;
  }

  const parsedGrades = Array.isArray(eligibilityGrades) && eligibilityGrades.length > 0
    ? eligibilityGrades.map((g) => parseInt(g, 10)).filter((g) => g >= 1 && g <= 12)
    : [6, 7, 8, 9, 10, 11, 12];

  const gradeText = eligibilityText || `Class ${parsedGrades.join(', ')}`;

  const activity = await Activity.create({
    school_id: req.schoolId,
    title,
    category,
    description,
    date: new Date(date),
    time,
    location,
    eligibility: {
      grades: parsedGrades,
      text: gradeText,
    },
    maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
    registrationDeadline: new Date(registrationDeadline),
    registrationDetails: registrationDetails || '',
    organizer: {
      user_id: req.user.user_id || req.user.id,
      name: organizerName,
      role: req.user.role === 'Admin' ? 'Admin' : 'Teacher',
      email: organizerEmail,
    },
    status: 'active',
  });

  res.status(201).json({
    success: true,
    data: activity,
  });
}

/**
 * PUT /api/activities/:id
 * Update activity details (Teacher creator or Admin)
 */
async function updateActivity(req, res) {
  const activity = await Activity.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  // Authorization check: Admin or creator Teacher
  if (
    req.user.role !== 'Admin' &&
    activity.organizer.user_id.toString() !== (req.user.user_id || req.user.id).toString()
  ) {
    throw new ApiError(403, 'Access denied. You can only update activities you created.');
  }

  const {
    title,
    category,
    description,
    date,
    time,
    location,
    eligibilityGrades,
    eligibilityText,
    maxParticipants,
    registrationDeadline,
    registrationDetails,
    status,
  } = req.body;

  if (title) activity.title = title;
  if (category) activity.category = category;
  if (description) activity.description = description;
  if (date) activity.date = new Date(date);
  if (time) activity.time = time;
  if (location) activity.location = location;
  if (status) activity.status = status;
  if (registrationDeadline) activity.registrationDeadline = new Date(registrationDeadline);
  if (registrationDetails !== undefined) activity.registrationDetails = registrationDetails;

  if (maxParticipants !== undefined) {
    activity.maxParticipants = maxParticipants ? parseInt(maxParticipants, 10) : null;
  }

  if (Array.isArray(eligibilityGrades)) {
    const parsedGrades = eligibilityGrades
      .map((g) => parseInt(g, 10))
      .filter((g) => g >= 1 && g <= 12);
    activity.eligibility.grades = parsedGrades;
    activity.eligibility.text = eligibilityText || `Class ${parsedGrades.join(', ')}`;
  } else if (eligibilityText) {
    activity.eligibility.text = eligibilityText;
  }

  await activity.save();

  res.json({
    success: true,
    data: activity,
  });
}

/**
 * DELETE /api/activities/:id
 * Cancel activity (Soft delete / status = cancelled)
 */
async function cancelActivity(req, res) {
  const activity = await Activity.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  if (
    req.user.role !== 'Admin' &&
    activity.organizer.user_id.toString() !== (req.user.user_id || req.user.id).toString()
  ) {
    throw new ApiError(403, 'Access denied. You can only cancel activities you created.');
  }

  activity.status = 'cancelled';
  await activity.save();

  res.json({
    success: true,
    message: 'Activity cancelled successfully',
    data: activity,
  });
}

/**
 * POST /api/activities/:id/register
 * Register student for an activity
 */
async function registerStudent(req, res) {
  if (req.user.role !== 'Student') {
    throw new ApiError(403, 'Only students can register for activities.');
  }

  const studentId = req.user.student_id;
  if (!studentId) {
    throw new ApiError(400, 'Student profile not linked to user account.');
  }

  const student = await Student.findById(studentId).setOptions({
    schoolId: req.schoolId,
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found.');
  }

  const activity = await Activity.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found.');
  }

  if (activity.status !== 'active') {
    throw new ApiError(400, `Cannot register for an activity with status '${activity.status}'.`);
  }

  // Check 1: Registration deadline
  if (new Date() > new Date(activity.registrationDeadline)) {
    throw new ApiError(400, 'Registration deadline for this activity has passed.');
  }

  // Check 2: Max participants limit
  const currentCount = await ActivityRegistration.countDocuments({
    activity_id: activity._id,
    status: 'registered',
  }).setOptions({ schoolId: req.schoolId });

  if (activity.maxParticipants && currentCount >= activity.maxParticipants) {
    throw new ApiError(400, 'Activity has reached its maximum participant limit.');
  }

  // Check 3: Grade Eligibility
  if (
    activity.eligibility?.grades?.length > 0 &&
    !activity.eligibility.grades.includes(student.grade)
  ) {
    throw new ApiError(
      400,
      `You are in Grade ${student.grade}, but this activity is only eligible for Grade ${activity.eligibility.grades.join(', ')}.`
    );
  }

  // Check 4: Duplicate registration
  const existingReg = await ActivityRegistration.findOne({
    activity_id: activity._id,
    student_id: student._id,
  }).setOptions({ schoolId: req.schoolId });

  if (existingReg) {
    if (existingReg.status === 'registered') {
      throw new ApiError(400, 'You are already registered for this activity.');
    }
    // Re-activate previously cancelled registration
    existingReg.status = 'registered';
    existingReg.registered_at = new Date();
    await existingReg.save();

    return res.json({
      success: true,
      message: 'Registration re-activated successfully',
      data: existingReg,
    });
  }

  // Create new registration
  const registration = await ActivityRegistration.create({
    school_id: req.schoolId,
    activity_id: activity._id,
    student_id: student._id,
    status: 'registered',
    registered_at: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Successfully registered for activity',
    data: registration,
  });
}

/**
 * DELETE /api/activities/:id/register
 * Cancel student registration for an activity
 */
async function unregisterStudent(req, res) {
  if (req.user.role !== 'Student') {
    throw new ApiError(403, 'Only students can unregister from activities.');
  }

  const studentId = req.user.student_id;
  const registration = await ActivityRegistration.findOne({
    activity_id: req.params.id,
    student_id: studentId,
    status: 'registered',
  }).setOptions({ schoolId: req.schoolId });

  if (!registration) {
    throw new ApiError(404, 'Active registration not found.');
  }

  registration.status = 'cancelled';
  await registration.save();

  res.json({
    success: true,
    message: 'Successfully unregistered from activity',
  });
}

/**
 * GET /api/activities/:id/participants
 * View list of students registered for an activity (Teacher or Admin)
 */
async function getActivityParticipants(req, res) {
  const activity = await Activity.findById(req.params.id).setOptions({
    schoolId: req.schoolId,
  });

  if (!activity) {
    throw new ApiError(404, 'Activity not found');
  }

  if (
    req.user.role !== 'Admin' &&
    activity.organizer.user_id.toString() !== (req.user.user_id || req.user.id).toString()
  ) {
    throw new ApiError(403, 'Access denied. You can only view participants for activities you manage.');
  }

  const registrations = await ActivityRegistration.find({
    activity_id: activity._id,
    status: 'registered',
  })
    .populate({
      path: 'student_id',
      select: 'name roll_no grade section dob',
    })
    .sort({ registered_at: 1 })
    .setOptions({ schoolId: req.schoolId });

  const participants = registrations.map((reg) => ({
    registration_id: reg._id,
    registered_at: reg.registered_at,
    student: reg.student_id,
  }));

  res.json({
    success: true,
    activity: {
      id: activity._id,
      title: activity.title,
      category: activity.category,
      maxParticipants: activity.maxParticipants,
      currentCount: participants.length,
    },
    count: participants.length,
    data: participants,
  });
}

module.exports = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  cancelActivity,
  registerStudent,
  unregisterStudent,
  getActivityParticipants,
};
