import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Image, Button, Modal, Form, InputGroup, Pagination } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { scheduleService, cinemaService } from '../services/api';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  
  // Data states
  const [schedules, setSchedules] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    movie_name: '',
    cinema_id: ''
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Effect for fetching cinemas (for filter dropdown)
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await cinemaService.getCinemas();
        setCinemas(data);
      } catch (err) {
        console.error('Error fetching cinemas:', err);
      }
    };
    
    fetchCinemas();
  }, []);

  // Effect for fetching schedules with filters
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const result = await scheduleService.getFilteredSchedules(filters);
        setSchedules(result.data);
        setPagination(result.pagination);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Không thể tải lịch chiếu phim. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page on filter change
    });
  };
  
  // Handle search button click
  const handleSearch = (e) => {
    e.preventDefault();
    // Filters are already applied via useEffect when filters state changes
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 5,
      movie_name: '',
      cinema_id: ''
    });
  };

  // Format date without timezone conversion - hiển thị đúng thời gian từ API
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Phân tách chuỗi ISO để lấy các thành phần
    const datePart = dateString.substring(0, 10); // YYYY-MM-DD
    const timePart = dateString.substring(11, 16); // HH:MM
    
    // Tạo đối tượng Date chỉ để định dạng phần ngày tháng
    const date = new Date(datePart);
    
    // Định dạng ngày tháng
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    const formattedDate = date.toLocaleDateString('vi-VN', options);
    
    // Kết hợp phần ngày đã định dạng với phần giờ nguyên bản
    return `${formattedDate}, ${timePart}`;
  };
  
  // Hàm mới để hiển thị giờ chính xác từ API
  const displayOriginalTime = (dateString) => {
    if (!dateString) return '';
    // Lấy phần giờ phút trực tiếp từ chuỗi ISO
    return dateString.substring(11, 16);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Fallback image if movie image is not available
  const fallbackImage = "https://via.placeholder.com/120x180/e0e0e0/808080?text=No+Image";
  
  // Handle opening delete confirmation modal
  const handleShowDeleteModal = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };
  
  // Handle closing delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleEditSchedule = (schedule) => {
    navigate(`/schedule/edit/${schedule.schedule_id}`);
  };
  
  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      await scheduleService.deleteSchedule(scheduleToDelete.schedule_id);
      
      // Update the schedules by refetching with current filters
      const result = await scheduleService.getFilteredSchedules(filters);
      setSchedules(result.data);
      setPagination(result.pagination);
      
      // Show success message
      setSuccess(`Đã xóa lịch chiếu phim "${scheduleToDelete.movie.name}" thành công!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
      // Close the modal
      handleCloseDeleteModal();
      setDeleteLoading(false);
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError('Không thể xóa lịch chiếu. Vui lòng thử lại sau.');
      setDeleteLoading(false);
    }
  };
  
  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page <= 1 || loading}
      />
    );
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
          disabled={loading}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages || loading}
      />
    );
    
    return items;
  };

  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>
              <h3>Dashboard</h3>
            </Card.Header>
            <Card.Body>
              <Card.Title>Xin chào, {user?.username}!</Card.Title>
              <Card.Text>
                Bạn đã đăng nhập thành công vào hệ thống.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Tìm Kiếm Lịch Chiếu</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="align-items-end">
                  <Col sm={12} md={5} lg={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tên Phim</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên phim..."
                        name="movie_name"
                        value={filters.movie_name}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col sm={12} md={5} lg={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Rạp Chiếu</Form.Label>
                      <Form.Select
                        name="cinema_id"
                        value={filters.cinema_id}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tất cả rạp</option>
                        {cinemas.map(cinema => (
                          <option key={cinema.id} value={cinema.id}>
                            {cinema.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col sm={12} md={2} lg={4} className="mb-3">
                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit" className="flex-grow-1">
                        Tìm Kiếm
                      </Button>
                      <Button variant="secondary" onClick={handleResetFilters}>
                        Đặt Lại
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Lịch Chiếu Phim</h4>
              <div className="text-white">
                Hiển thị {schedules.length} / {pagination.total} lịch chiếu
              </div>
            </Card.Header>
            <Card.Body>
              {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Đang tải lịch chiếu...</p>
                </div>
              ) : schedules.length === 0 ? (
                <Alert variant="info">
                  {filters.movie_name || filters.cinema_id ? 
                    'Không tìm thấy lịch chiếu phù hợp với bộ lọc.' : 
                    'Không có lịch chiếu nào.'}
                </Alert>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th style={{ width: '150px' }}>Ảnh</th>
                          <th>Phim</th>
                          <th>Rạp</th>
                          <th>Phòng</th>
                          <th>Thời gian</th>
                          <th>Giá vé</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((schedule) => (
                          <tr key={schedule.schedule_id}>
                            <td>
                              <Image 
                                src={schedule.movie.img || fallbackImage} 
                                alt={schedule.movie.name}
                                onError={(e) => { e.target.src = fallbackImage; }}
                                style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                                thumbnail
                              />
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <strong>{schedule.movie.name}</strong>
                                <div className="my-1">
                                  <Badge bg="secondary" className="me-1">{schedule.movie.genre}</Badge>
                                  <Badge bg="info">{schedule.movie.label}</Badge>
                                </div>
                                <small>{schedule.movie.duration} phút</small>
                                <p className="text-muted small mt-1 mb-0">{schedule.movie.description}</p>
                              </div>
                            </td>
                            <td>{schedule.room.cinema.name}</td>
                            <td>
                              {schedule.room.name}
                              <div><small className="text-muted">{schedule.room.type}</small></div>
                            </td>
                            <td>
                              <div>{formatDate(schedule.start_time)}</div>
                              <small className="text-muted">
                                Đến: {displayOriginalTime(schedule.end_time)}
                              </small>
                              {/* <div className="text-muted small">
                                <code className="bg-light p-1 rounded d-block mt-1" style={{ fontSize: '10px' }}>
                                  {schedule.start_time}
                                </code>
                              </div> */}
                            </td>
                            <td>
                              <div>Thường: {formatCurrency(schedule.normal_seat_price)}</div>
                              <div>VIP: {formatCurrency(schedule.vip_seat_price)}</div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  Sửa
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm"
                                  onClick={() => handleShowDeleteModal(schedule)}
                                >
                                  Xóa
                                </Button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <span className="text-muted">
                        Trang {pagination.page} / {pagination.totalPages}
                      </span>
                    </div>
                    
                    <Pagination className="mb-0">
                      {renderPaginationItems()}
                    </Pagination>
                    
                    <div>
                      <Form.Select 
                        size="sm" 
                        style={{ width: '80px' }}
                        value={filters.limit}
                        onChange={(e) => setFilters({
                          ...filters,
                          limit: e.target.value,
                          page: 1
                        })}
                        disabled={loading}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                      </Form.Select>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {scheduleToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa lịch chiếu sau?</p>
              <div className="d-flex align-items-center mb-3">
                <Image 
                  src={scheduleToDelete.movie.img || fallbackImage} 
                  alt={scheduleToDelete.movie.name}
                  onError={(e) => { e.target.src = fallbackImage; }}
                  style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                  className="me-3"
                  thumbnail
                />
                <div>
                  <h5>{scheduleToDelete.movie.name}</h5>
                  <p className="mb-0">
                    <strong>Rạp:</strong> {scheduleToDelete.room.cinema.name}<br />
                    <strong>Thời gian:</strong> {formatDate(scheduleToDelete.start_time)}
                  </p>
                  <div className="text-muted small mt-1">
                    <code className="bg-light p-1 rounded d-block" style={{ fontSize: '10px' }}>
                      {scheduleToDelete.start_time}
                    </code>
                  </div>
                </div>
              </div>
              <Alert variant="warning">
                Lưu ý: Hành động này không thể hoàn tác.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={deleteLoading}>
            Hủy bỏ
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;